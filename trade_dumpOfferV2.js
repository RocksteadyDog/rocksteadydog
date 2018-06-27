
var api = Spark.getGameDataService();

var playerID = Spark.getPlayer().getPlayerId();
var dumpOfferId = Spark.getData().offerId;

var playerDocument = api.getItem("playerTradeData", playerID).document();

if (playerDocument == null){
   Spark.getLog().error({msg : "Player Document is null!", type : "trade"});
   Spark.setScriptError("error","Player Document is Null!");
   Spark.exit();
}

Spark.lockKey(dumpOfferId, 12000);

var spliceIndex = -1;

function GetOffer(offers,offerId)
{ 
    var offersLength = offers.length;
    for ( i = 0 ; i < offersLength; i++){
      var offer = offers[i];
      if (offer.offerId == offerId){
        spliceIndex = i;
        return offer;
      }
    }
   return null;
}

var playerData = playerDocument.getData();
var offer = GetOffer(playerData.offers, dumpOfferId);

if (spliceIndex == -1)
{
    Spark.getLog().error({msg: "offer == null",offerId : dumpOfferId});
    Spark.setScriptError("result","Whaaat?!!_0"); 
}
else{
   
    if (offer != null){
        
        if (offer.state != 2){     
            
            playerData.offers.splice(spliceIndex,1); 
            
            var status = playerDocument.persistor().persist().error();
            if(status){
                Spark.getLog().error({msg : "Error Persist Document", type : "trade"});
                Spark.setScriptError("error", status);
            }else{
                
                if (offer.advertiseTime != 0){
                     var dumpDoc = api.getItem("globalMarket", dumpOfferId).document();
                     if (dumpDoc != null)
                          dumpDoc.delete();
                          
                    var scheduler = Spark.getScheduler();
                    scheduler.cancel(dumpOfferId);
                }
                
                Spark.getRedis().incr ("Dump Offer");
                Spark.setScriptData("result",2);
            }

        }else{
          Spark.setScriptData("result",1);
        }
    }else{
        Spark.getLog().error({"msg": "offer == null","offerId" : dumpOfferId});
        Spark.setScriptError("result","Whaaat?!!_1");
    }   
}
Spark.unlockKey(dumpOfferId);
