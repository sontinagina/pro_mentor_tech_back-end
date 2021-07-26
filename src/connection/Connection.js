const mongoose=require("mongoose");
const getConnection=(props)=>{
  const db=mongoose.createConnection(
    `mongodb://localhost:${props.PORT}/${props.dbname}`,
    {
      useNewUrlParser:true,
      useUnifiedTopology:true,

    }
  );
  return db
}
module.exports={getConnection};