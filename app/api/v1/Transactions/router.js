const express = require('express');
const { authenticateUser, authorizeRoles } = require('../../../middlewares/auth');
const { index, create, find, update, destroy, readRevenue, readCountTransByStatus, readHighestSalesProduct, readLowestSalesProduct, updateShipment, lastSevenDaysTrans, lastOneYearTrans } = require('./controller');
const { CheckAvailProducts, reduceStockProduct } = require('../../../middlewares/product');
const getShipCost = require('../../../middlewares/shipmentCost');
const router = express();

router.get('/transactions', authenticateUser, authorizeRoles('superAdmin', 'admin'), index);

router.post('/transactions', authenticateUser, authorizeRoles('superAdmin', 'admin', 'user'), CheckAvailProducts, reduceStockProduct, getShipCost, create);

router.get('/transactions/revenue', authenticateUser, authorizeRoles('superAdmin', 'admin'), readRevenue);

router.post('/transactions/countTransByStatus', authenticateUser, authorizeRoles('superAdmin', 'admin'), readCountTransByStatus);

router.get('/transactions/readHighestSalesProduct', authenticateUser, authorizeRoles('superAdmin', 'admin'), readHighestSalesProduct);

router.get('/transactions/readLowestSalesProduct', authenticateUser, authorizeRoles('superAdmin', 'admin'), readLowestSalesProduct);

router.get('/transactions/lastSevenDays', authenticateUser, authorizeRoles('superAdmin', 'admin'), lastSevenDaysTrans);

router.get('/transactions/lastOneYear', authenticateUser, authorizeRoles('superAdmin', 'admin'), lastOneYearTrans);

router.put('/transactions/shipmentStatus/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), updateShipment);

router.put('/transactions/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), update);

router.delete('/transactions/:id', authenticateUser, authorizeRoles('superAdmin', 'admin'), destroy);

router.get('/transactions/:id', authenticateUser, authorizeRoles('superAdmin', 'admin', 'user'), find);



module.exports = router;