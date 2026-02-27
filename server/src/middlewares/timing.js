// Request timing middleware
export const requestTiming = (req, res, next) => {
  const startTime = Date.now();
  
  // Store start time
  req.startTime = startTime;
  
  // Override res.json to capture response time
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    // Add timing header
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
    
    // Log request info in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${req.method} ${req.path} - ${duration}ms`);
    }
    
    return originalJson(data);
  };
  
  next();
};

export default requestTiming;
