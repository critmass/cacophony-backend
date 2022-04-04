// this was borrowed and modified from Express Jobly project

const { BadRequestError } = require("../expressError");

// This parses an object to create a sql string and values for
// creating the "where" part of the sql string

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  const allValues = Object.values(dataToUpdate)
  const values = []
  if (keys.length === 0) throw new BadRequestError("No data");

  // removes empty values
  const colsData = keys.reduce( (reducedKeys, key, i) => {
    if(dataToUpdate[key] != undefined) {
      reducedKeys.push(key)
      values.push(allValues[i])
    }
    return reducedKeys
  },[])

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = colsData.map((colName, idx) => {
    return `${jsToSql[colName] || colName}=$${idx + 1}`
  });

  const setCols = cols.join(", ")

  return { setCols, values };
}

module.exports = { sqlForPartialUpdate };
