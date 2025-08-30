import React, { useEffect, useState } from 'react';
function ChangeTable() {
  const [changes, setChanges] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    // Dynamically load all JSON files in public/Changes
    const fetchAllChanges = async () => {
      try {
        // Use GitHub API to get the actual list of files in the Changes directory
        // This is more efficient than guessing filenames
        let allChanges = [];
        
        try {
          // Try to fetch from GitHub API to get actual file list
          const repoApiUrl = 'https://api.github.com/repos/DanielBradley1/EntraDocsTracker/contents/entradocstracker/public/Changes';
          const response = await fetch(repoApiUrl);
          
          if (response.ok) {
            const files = await response.json();
            
            // Calculate date 7 days ago
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const jsonFiles = files
              .filter(file => file.name.match(/^entra-changes-\d{8}-\d{4}\.json$/))
              .filter(file => {
                // Extract date from filename (format: entra-changes-YYYYMMDD-HHMM.json)
                const dateMatch = file.name.match(/entra-changes-(\d{8})-\d{4}\.json/);
                if (dateMatch) {
                  const fileDate = dateMatch[1];
                  const year = parseInt(fileDate.substring(0, 4));
                  const month = parseInt(fileDate.substring(4, 6)) - 1; // Month is 0-indexed
                  const day = parseInt(fileDate.substring(6, 8));
                  const fileDateObj = new Date(year, month, day);
                  return fileDateObj >= sevenDaysAgo;
                }
                return false; // If we can't parse the date, exclude the file
              })
              .map(file => file.name);
            
            // Fetch each JSON file from the last 7 days only
            for (const fileName of jsonFiles) {
              try {
                const resp = await fetch(process.env.PUBLIC_URL + '/Changes/' + fileName);
                if (resp.ok) {
                  const data = await resp.json();
                  allChanges = allChanges.concat(data);
                }
              } catch (err) {
                console.error('Error loading', fileName, err);
              }
            }
          }
        } catch (apiError) {
          // Fallback: if GitHub API fails, try a simpler approach with known recent patterns
          console.log('GitHub API unavailable, using fallback method');
          
          // Just try a few recent dates with common times from your existing files
          const today = new Date();
          const recentFiles = [];
          
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`;
            
            // Only try the times we know exist from your current files
            const knownTimes = ['0758', '0842'];
            
            for (const time of knownTimes) {
              recentFiles.push(`entra-changes-${dateStr}-${time}.json`);
            }
          }
          
          // Test which files actually exist
          for (const file of recentFiles) {
            try {
              const resp = await fetch(process.env.PUBLIC_URL + '/Changes/' + file);
              if (resp.ok) {
                const data = await resp.json();
                allChanges = allChanges.concat(data);
              }
            } catch {
              // File doesn't exist, skip
            }
          }
        }
        // Sort by date descending
        allChanges.sort((a, b) => new Date(b.date) - new Date(a.date));
        setChanges(allChanges);
      } catch (err) {
        console.error('Error loading all changes:', err);
        setChanges([]);
      }
    };
    fetchAllChanges();
  }, []);

  const toggleExpand = idx => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div>
      <div className="ed-info-banner">
        Want to learn how this tool works? <a href="https://ourcloudnetwork.com/what-is-entradocstracker/" target="_blank" rel="noopener noreferrer">Read our comprehensive guide</a> to understand how EntraDocsTracker monitors and tracks documentation changes.
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
                <td><div className="ed-summary">{change.ai_summary}</div></td>
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
