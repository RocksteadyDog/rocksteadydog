var api = Spark.getGameDataService();

var playerID = Spark.getPlayer().getPlayerId();
var offerId = Spark.getData().offerId;


var playerDocument = api.getItem("playerTradeData", playerID).document();

if (playerDocument == null)
{
   Spark.getLog().error({msg : "Player Document is null!", type : "trade"});
   Spark.setScriptError("ResultError","Player Document is Null!");
   Spark.exit();
}

Spark.lockKey(offerId, 12000);

var spliceIndex = -1;

function GetOffer(offers,offerId)
{ 
  var offersLength = offers.length;
    for ( i = 0 ; i < offersLength; i++)
    {
      var offer = offers[i];
      if (offer.offerId == offerId)
      {
        spliceIndex = i;
        return offer;
      }
    }
   return null;
}

var playerData = playerDocument.getData();
var offer = GetOffer(playerData.offers, offerId);

if (spliceIndex == -1){
    Spark.getLog().error({msg: "offer == null",offerId : offerId, type : "trade"});
    Spark.setScriptError("result","Offer Not Found!"); 
}else{

    playerData.offers.splice(spliceIndex,1); 
    
    var status = playerDocument.persistor().persist().error();
    if (status){
        Spark.getLog().error({msg : "Error Persist Document", type : "trade"});
        Spark.setScriptError("error", status);
    }else{
      Spark.setScriptData("Remove: ", offer.offerId);   
    }
}
Spark.unlockKey(offerId);
