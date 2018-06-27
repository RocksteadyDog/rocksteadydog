

var playerID = Spark.getPlayer().getPlayerId();
var api = Spark.getGameDataService();

var doc = api.getItem("playerTradeData", playerID).document();

if (doc == null)
{
    doc = api.createItem("playerTradeData", playerID);
    var status = doc.persistor().persist().error();
    
    if(status){
        Spark.getLog().error({msg : "Error Persist Document", type : "trade"});
        Spark.setScriptError("error", status);
        Spark.exit();
    }
}

var playerTradeData = doc.getData();

playerTradeData.date = Date.now();

Spark.setScriptData("trade", playerTradeData);
