const { RajaOngkirServerKey } = require('../../config');
const rajaOngkir = require('rajaongkir-nodejs').Starter(RajaOngkirServerKey);
const { NotFoundError } = require('../../errors');

const getShipmentCost = async (req) => {
  const params = {
    origin: req.body.expedition.origin_details.city_id, // ID Kota atau Kabupaten Asal
    destination: req.body.expedition.destination_details.city_id, // ID Kota atau Kabupaten Tujuan
    weight: (req.body.totalWeight * 1000) // Berat Barang dalam gram (gr)
  };

  let shipmentCost;
  if (req.body.courierCode.toLowerCase() === 'jne') {
    shipmentCost = await rajaOngkir.getJNECost(params).then(function (result) {
      // Aksi ketika data Biaya berhasil ditampilkan
      return result;
    }).catch(function (error) {
      // Aksi ketika error terjadi
      throw new NotFoundError(error);
    });
  }
  else if (req.body.courierCode.toLowerCase() === 'post') {
    shipmentCost = await rajaOngkir.getPOSTCost(params).then(function (result) {
      // Aksi ketika data Biaya berhasil ditampilkan
      return result;
    }).catch(function (error) {
      // Aksi ketika error terjadi
      throw new NotFoundError(error);
    });
  }
  else if (req.body.courierCode.toLowerCase() === 'tiki') {
    shipmentCost = await rajaOngkir.getTIKICost(params).then(function (result) {
      // Aksi ketika data Biaya berhasil ditampilkan
      return result;
    }).catch(function (error) {
      // Aksi ketika error terjadi
      throw new NotFoundError(error);
    });
  }

  const expedition = {
    "origin_details": shipmentCost.rajaongkir.origin_details,
    "destination_details": shipmentCost.rajaongkir.destination_details,
    "courierDetail": {
      "code": shipmentCost.rajaongkir.results[0].code,
      "name": shipmentCost.rajaongkir.results[0].name,
      "costs": {
        "service": shipmentCost.rajaongkir.results[0].costs[req.body.courierServiceCode].service,
        "description": shipmentCost.rajaongkir.results[0].costs[req.body.courierServiceCode].description,
        "cost": {
          value: shipmentCost.rajaongkir.results[0].costs[req.body.courierServiceCode].cost[0].value,
          etd: shipmentCost.rajaongkir.results[0].costs[req.body.courierServiceCode].cost[0].etd,
        }
      },
    }

  }

  return expedition;
}
module.exports = {
  getShipmentCost
}