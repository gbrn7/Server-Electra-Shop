const { getShipmentCost } = require("../services/rajaOngkir/index,");

const getShipCost = async (req, res, next) => {
  try {
    const result = await getShipmentCost(req);

    req.body.expedition = result;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = getShipCost;
