import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
function ChangeTable() {
  const [changes, setChanges] = useState([]);
  const [expanded, setExpanded] = useState({});

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

  const toggleExpand = idx => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div>
      <div className="ed-info-banner">
        Want to learn how this tool works? <a href="https://ourcloudnetwork.com/what-is-entra-docs-tracker/" target="_blank" rel="noopener noreferrer">Read our comprehensive guide</a> to understand how EntraDocsTracker monitors and tracks documentation changes.
      </div>
      <div className="ed-table-container">
        <h2 className="ed-changes-title">Recent Entra Docs Changes</h2>
        <table className="ed-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>AI Summary</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((change, idx) => (
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
