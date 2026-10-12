// test service here: business logic only, no req/res 
const testRouteService = (userId) => { 
    return { message: "You are signed in", userId }; 
}; 

export default testRouteService;
