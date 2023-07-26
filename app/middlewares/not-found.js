//if request doesn't have e err argument this error funct will execute because this function not receive err argument
const notFound = (req, res) => res.status(404).send({ msg: 'Route does not exist' });
module.exports = notFound;