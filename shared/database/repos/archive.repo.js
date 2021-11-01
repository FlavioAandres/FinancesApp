const ArchiveModel = require('../../models/archive.model');
const { connect, destroy, isConnected } = require("../mongo");

module.exports.insertMany = async (ArchiveArray) => {
    if(!isConnected())
        await connect()
    try {
        const result = await ArchiveModel.insertMany(ArchiveArray); 
        return result.length > 0
    } catch (error) {
        console.error(error)
        return false; 
    } finally{
        await destroy(); 
    }
}