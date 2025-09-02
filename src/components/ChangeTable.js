import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
function ChangeTable() {
  const [changes, setChanges] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load changes from the single changes.json file
    const fetchChanges = async () => {
      try {
        const response = await fetch(process.env.PUBLIC_URL + '/changes.json');
        
        if (response.ok) {
          const data = await response.json();
          
          // Extract changes array from the response
          const changesData = data.changes || [];
          
          // Sort by date descending (most recent first)
          changesData.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setChanges(changesData);
        } else {
          console.error('Failed to fetch changes.json:', response.status);
          setChanges([]);
        }
      } catch (err) {
        console.error('Error loading changes:', err);
        setChanges([]);
      }
    };
    fetchChanges();
  }, []);

  // Performant filtering using useMemo
  const filteredChanges = useMemo(() => {
    if (!searchTerm.trim()) {
      return changes;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return changes.filter(change => {
      // Search in AI summary
      const summary = change.ai_summary?.Response || change.ai_summary || '';
      if (summary.toLowerCase().includes(searchLower)) return true;
      
      // Search in author
      if (change.author && change.author.toLowerCase().includes(searchLower)) return true;
      
      // Search in file names
      if (change.files && change.files.some(file => 
        file.filename.toLowerCase().includes(searchLower)
      )) return true;
      
      // Search in date (formatted)
      const dateStr = new Date(change.date).toLocaleString().toLowerCase();
      if (dateStr.includes(searchLower)) return true;
      
      return false;
    });
  }, [changes, searchTerm]);

  const toggleExpand = idx => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Clear expanded state when searching to avoid index mismatches
    setExpanded({});
  };

  return (
    <div>
      <div className="ed-info-banner">
        Want to learn how this tool works? <a href="https://ourcloudnetwork.com/what-is-entra-docs-tracker/" target="_blank" rel="noopener noreferrer">Read our comprehensive guide</a> to understand how EntraDocsTracker monitors and tracks documentation changes.
      </div>
      <div className="ed-table-container">
        <h2 className="ed-changes-title">Recent Entra Docs Changes</h2>
        
        {/* Search Bar */}
        <div className="ed-search-container">
          <div className="ed-search-wrapper">
            <svg className="ed-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              className="ed-search-input"
              placeholder="Search changes by summary, author, file names, or date..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button 
                className="ed-search-clear"
                onClick={() => handleSearchChange({ target: { value: '' } })}
                title="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="ed-search-results">
              Showing {filteredChanges.length} of {changes.length} changes
            </div>
          )}
        </div>

        <table className="ed-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>AI Summary</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredChanges.map((change, idx) => (
            <React.Fragment key={change.sha}>
              <tr>
                <td>{new Date(change.date).toLocaleString()}</td>
                <td>
                  <div className="ed-summary">
                    <ReactMarkdown>{change.ai_summary?.Response || change.ai_summary || "No summary available"}</ReactMarkdown>
                  </div>
                </td>
                <td>
                  <button className="ed-expand-btn" onClick={() => toggleExpand(idx)}>
                    {expanded[idx] ? 'Hide' : 'Show'}
                  </button>
                </td>
              </tr>
              {expanded[idx] && (
                <tr className="ed-details-row">
                  <td colSpan={3} style={{padding: 0, background: 'transparent'}}>
                    <div className="ed-details ed-details-expanded">
                      <div><strong>Author:</strong> {change.author}</div>
                      <div><strong>Date:</strong> {new Date(change.date).toLocaleString()}</div>
                      <div><strong>Commit:</strong> <a href={change.url} target="_blank" rel="noopener noreferrer">View on GitHub</a></div>
                      {change.files && change.files.length > 0 && (
                        <div className="ed-files-list">
                          <div style={{margin: '0.7rem 0 0.2rem 0', fontWeight: 600}}>Changed Files:</div>
                          <ul className="ed-files-ul">
                            {change.files.map((file, fidx) => {
                              let fileClass = '';
                              let label = '';
                              if (file.status === 'added') {
                                fileClass = 'ed-file-added';
                                label = 'New';
                              } else if (file.status === 'removed') {
                                fileClass = 'ed-file-removed';
                                label = 'Deleted';
                              } else if (file.status === 'modified') {
                                fileClass = 'ed-file-modified';
                                label = 'Updated';
                              } else if (file.status === 'renamed') {
                                fileClass = 'ed-file-renamed';
                                label = 'Renamed';
                              }
                              return (
                                <li key={fidx} className={`ed-file-item ${fileClass}`}>
                                  <span className="ed-file-label">{label}</span>
                                  <span className="ed-file-name">{file.filename}</span>
                                  <span className="ed-file-meta">{file.status === 'modified' && `(+${file.additions}, -${file.deletions})`}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
          </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

export default ChangeTable;
