
var api = Spark.getGameDataService();

var playerID = Spark.getPlayer().getPlayerId();
var editOfferId = Spark.getData().offerId;
var advertiseTime = Spark.getData().advertiseTime;

var playerDocument = api.getItem("playerTradeData", playerID).document();

if (playerDocument == null)
{
   Spark.getLog().error({msg : "Player Document is null!", type : "trade"});
   Spark.setScriptError("error","Player Document is Null!");
   Spark.exit();
}

Spark.lockKey(editOfferId, 12000);

function GetOffer(offers,offerId)
{ 
  var offersLength = offers.length;
    for ( i = 0 ; i < offersLength; i++){
      var offer = offers[i];
      if (offer.offerId == offerId){
        return offer;
      }
    }
  return null;
}

var offersData = playerDocument.getData();
var offer = GetOffer(offersData.offers, editOfferId);

if (offer == null){
    Spark.setScriptError("result","Offer Not Found!");
}else{
    
    if (offer.state != 2 && offer.advertiseTime == 0){
        
        var offerTTL = advertiseTime + Date.now();
        
        offer.createdAt = Date.now();
        offer.advertiseTime = offerTTL;
        
        var doc = api.createItem("globalMarket",editOfferId);
        doc.setData(offer);
        doc.setTTL(offerTTL);
        
        var statusGlobal = doc.persistor().persist().error();
        
        if (statusGlobal){
            Spark.setScriptError("ERROR", status);
        }else{
            
            var status = playerDocument.persistor().persist().error();
            
            if (status){
                 Spark.getLog().error({msg : "Error Persist Document", type : "trade"});
                 var dumpDoc = api.getItem("globalMarket", editOfferId).document();
                 if (dumpDoc != null)
                      dumpDoc.delete();
                Spark.setScriptError("ERROR", status);
            }else{
                
                var scheduler = Spark.getScheduler();
                scheduler.inSeconds("trade_advertiseExpire", advertiseTime/1000, {"offerId" : editOfferId}, editOfferId);
                
                Spark.setScriptData("Add In Global Market: ", doc);
                Spark.setScriptData("result",2);
             
                Spark.getRedis().incr ("Add Global Offer");
                Spark.getRedis().incr ("Edit Offer");
            }
        }
    }else{
      Spark.setScriptData("result",1);
    }  
}

Spark.unlockKey(editOfferId);


