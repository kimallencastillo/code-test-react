import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { baseUrl } from '../assets/shared';
import { nanoid } from 'nanoid';

function Launches() {
  const [launches, setLaunches] = useState([]);
  const [filteredLaunches, setFilteredLaunches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = launches.filter((launch) =>
        launch.mission_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLaunches(filtered);
    } else {
      setFilteredLaunches(launches);
    }
  }, [searchTerm, launches]);

  const fetchData = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}?page=${pageNum}&limit=10`);
      const newLaunches = response.data;

      if (newLaunches.length === 0) {
        setHasMore(false);
      } else {
        setLaunches((prev) => [...prev, ...newLaunches]);
        setFilteredLaunches((prev) => [...prev, ...newLaunches]);
      }
    } catch (error) {
      console.error('Error fetching launches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewClick = (launch) => {
    if (selectedLaunch === launch && showDetails) {
      setShowDetails(false);
      setSelectedLaunch(null);
    } else {
      setSelectedLaunch(launch);
      setShowDetails(true);
    }
  };

  const lastLaunchObserver = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  return (
    <div className="">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Launch Cards */}
      <div className="container">
        {filteredLaunches.map((launch, index) => (
          <div
            key={nanoid()}
            ref={
              filteredLaunches.length === index + 1 ? lastLaunchObserver : null
            }
            className="launch-card"
          >
            <div className="mission-name-container">
              <span
                className={`status-badge ${
                  launch.upcoming ? 'status-upcoming' : 'status-failed'
                }`}
              >
                {launch.upcoming ? 'Upcoming' : 'Failed'}
              </span>
              <div className="mission-name">{launch.mission_name}</div>
            </div>

            <button
              className="view-button"
              onClick={() => handleViewClick(launch)}
            >
              {selectedLaunch === launch && showDetails ? 'Hide' : 'View'}
            </button>

            {selectedLaunch === launch && showDetails && (
              <div className="launch-details">
                <div className="launch-header">
                  <img
                    src={launch?.links?.mission_patch_small}
                    alt={launch.mission_name}
                    className="mission-patch"
                  />
                  <div>
                    <p className="launch-date">
                      {new Date(launch.launch_date_local).toLocaleDateString()}{' '}
                      ({new Date(launch.launch_date_local).getFullYear()} years
                      ago)
                    </p>
                    <div className="links">
                      <a href="#">Article</a> | <a href="#">Video</a>
                    </div>
                  </div>
                </div>

                <p className="launch-description">
                  {launch.details || 'No details available'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && <div className="loading text-center mt-4">Loading...</div>}

      {!hasMore && (
        <div className="no-more-data text-center mt-4">
          No more launches to load
        </div>
      )}
    </div>
  );
}

export default Launches;
