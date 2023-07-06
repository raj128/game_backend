const decodeUserCookie = (req, res, next) => {
    const { cookie } = req.headers;
  
    if (cookie) {
      const cookieParts = cookie.split(';');
      const decodedCookie = {};
  
      // Loop through cookie parts and extract key-value pairs
      for (let i = 0; i < cookieParts.length; i++) {
        const [key, value] = cookieParts[i].split('=');
        decodedCookie[key.trim()] = value;
      }
      console.log(decodedCookie.access_token);
      // Set user ID and isAdmin property in the request object
      req.userId = decodedCookie._id;
      req.isAdmin = decodedCookie.isAdmin === 'true'; // Convert string to boolean
    }
  
    next();
  };
  export default decodeUserCookie;