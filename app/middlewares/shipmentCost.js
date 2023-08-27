const { getShipmentCost } = require("../services/rajaOngkir/index,");

const getShipCost = async (req, res, next) => {
  try {
    console.log('error');
    const result = await getShipmentCost(req);

    req.body.expedition = result;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
}

module.exports = getShipCost;
