/**
 * Web Worker for offloading GeoJSON fetching and parsing
 */
self.onmessage = async (e) => {
  const { urls } = e.data;
  
  try {
    const results = {};
    
    // Fetch and parse all requested files in parallel
    const promises = Object.entries(urls).map(async ([key, url]) => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        results[key] = data;
      } catch (err) {
        console.error(`Worker failed to fetch ${url}:`, err);
        results[key] = null;
      }
    });
    
    await Promise.all(promises);
    
    // Send the parsed data back to the main thread
    self.postMessage({ success: true, data: results });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
