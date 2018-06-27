

var api = Spark.getGameDataService();

var glomarMarketID = "globalMarket";
var playerTradeDataID = "playerTradeData";

var playerID = Spark.getPlayer().getPlayerId();
var offer = Spark.getData().offer;

// if (offer.quantity < 1 || offer.quantity > 5){
//     Spark.setScriptError("ERROR", "CHEAT");
//     Spark.exit();
// }
//offer.offerId = playerID + Date.now();

offer.createdAt = Date.now();

var timeAdvertise = offer.advertiseTime;

if ( timeAdvertise > 0){
    
    var globalDoc = api.createItem(glomarMarketID,offer.offerId);
    var offerTTL = timeAdvertise + Date.now();

    offer.advertiseTime = offerTTL;

    globalDoc.setData(offer);
    globalDoc.setTTL(offerTTL);
    
    var status = globalDoc.persistor().persist().error();

    if(status){
        Spark.getLog().error({msg : "Error Persist Document", type : "trade"});
        Spark.setScriptError("error", status);
        Spark.exit();
    }else{
        AddOfferPlayer(true);
    }
    
}else{
    AddOfferPlayer(false); 
}

function AddOfferPlayer(global) {
    var playerDocument = api.getItem(playerTradeDataID, playerID).document();
    
    if (playerDocument == null){
        playerDocument = api.createItem(playerTradeDataID, playerID);
        playerDocument.persistor().persist();
    }

    var offersData = playerDocument.getData();

    if (offersData.offers == null)
         offersData.offers = []; 
        
    offersData.offers.push(offer);
    
    var status = playerDocument.persistor().persist().error();
    
    if(status){
        
         Spark.getLog().error({msg : "Error Persist Document", type : "trade"});
         var dumpDoc = api.getItem(glomarMarketID, offer.offerId).document();
         if (dumpDoc != null)
              dumpDoc.delete();
              //??????? status error
         Spark.setScriptError("error", status);
         Spark.exit();
    }else{
        
        if (global){
            
            var scheduler = Spark.getScheduler();
            scheduler.inSeconds("trade_advertiseExpire", timeAdvertise/1000, {"offerId" : offer.offerId}, offer.offerId);
            
            Spark.setScriptData("Add In Global Market: ", globalDoc);
            Spark.getRedis().incr ("Add Global Offer");
        }
        
       Spark.getRedis().incr ("Add Offer"); 
       Spark.setScriptData("result","Add Offer In Player Data!");
    }
}



