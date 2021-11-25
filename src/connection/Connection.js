const mongoose=require("mongoose");
const getConnection=(props)=>{
   // local database
   const db = mongoose.createConnection(
      `mongodb+srv://sontinagina:<sontinagina>@cluster0.jdszp.mongodb.net/PRO-MENTOR-TECHS?retryWrites=true&w=majority`,
      {
         useNewUrlParser: true,
         useUnifiedTopology: true,
      }
   );

   return db;

   //
}
module.exports={getConnection};