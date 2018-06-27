
var api = Spark.getGameDataService();

var playerID = Spark.getPlayer().getPlayerId();
var unlockCount = Spark.getData().unlockCount;


var playerDocument = api.getItem("playerTradeData", playerID).document();

if (playerDocument == null)
{
   Spark.getLog().error({msg : "Player Document is null!", type : "trade"});
   Spark.setScriptError("error","Player Document is null!");
   Spark.exit();
}

var playerData = playerDocument.getData();
playerData.unlockSlotsCount = unlockCount;

var status = playerDocument.persistor().persist().error();
if (status){
    Spark.getLog().error({msg : "Error Persist Document", type : "trade"});
    Spark.setScriptError("error", status);
}else{
    Spark.setScriptData("Result","UnlockSlotsCount = " + unlockCount);   
}

