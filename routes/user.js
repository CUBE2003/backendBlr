
const router = required ('express').Router();
const {verifyToken, verifyAndAuth, verifyAgent}=require('../middleware/verifyToken')
    const userController=require('../controllers/userController')
    // Get USER ROUTE
    router.get('/', verifyAndAuth, userController.getUser);
     // DELETE user ROUTE
     router. delete( '/:id', verifyAndAuth, userController.deleteUser);
    // GET userS ROUTE
     router.put('/', verityAndAuth, userController.updateuser)

    //  router.put('/',verifyAndAuth,userController.updateuser);
    //  router.post('/skills',verifyAndAuth,userController.updateuser);
    //  router.get('/skills',verifyAndAuth,userController.updateuser);
    //  router.delete('/skills/:id',verifyAndAuth,userController.updateuser);
     
     
    // router.put('/',verifyAndAuth,userController.updateuser);
    //  router.post('/agents',verifyAndAuth,userController.addAgent);
    //  router.put('/agents/:id',verifyAndAuth,userController.updateAgent);
    //  router.get('/agents/:uid',verifyAndAuth,userController.getAgent);
    //  router.get('/agents',verifyAndAuth,userController.getAgents);
    //  router.delete('/agents/:uid',verifyAndAuth,userController.updateAgent);
module, exports = router;


