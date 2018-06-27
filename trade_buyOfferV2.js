var api = Spark.getGameDataService();

var buyerId = Spark.getPlayer().getPlayerId();            
var sellerId = Spark.getData().sellerId;
var offerId = Spark.getData().offerId;

var sellerDocument = api.getItem("playerTradeData", sellerId).document();

if (sellerDocument == null)
{
   Spark.getLog().error({msg : "Seller Document is null!", type : "trade"});
   Spark.setScriptError("error","Seller Document is Null!");
   Spark.exit();
}

Spark.lockKey(offerId, 12000);

function GetOffer(offers, offerId)
{ 
  var offersLength = offers.length;
    for ( i = 0 ; i < offersLength; i++)
    {
      var offer = offers[i];
      if (offer.offerId == offerId)
      {
          return offer;
      }
    }
   return null;
}

var sellerData = sellerDocument.getData();
var offer = GetOffer( sellerData.offers, offerId);

// 0 - "Offer Not Found!", 1 - "Offer Buyed!",2 -  "Offer Purchased!"

if (offer == null){
    Spark.setScriptData("result",0); 
}else{
    
    if (offer.state !=2){
        
        offer.state = 2;
        offer.buyerId = buyerId;
            
        if (offer.advertiseTime > 0){
            var doc = api.getItem("globalMarket", offerId).document();
            if (doc != null){
                doc.delete();
                Spark.getRedis().incr ("Buy Global Offer");
                
                var scheduler = Spark.getScheduler();
                scheduler.cancel(offerId);
            }
            offer.advertiseTime = 0;
        }

        var status = sellerDocument.persistor().persist().error();
        
        if(status){
            Spark.getLog().error({msg : "Error Persist Document", type : "trade"});
            Spark.setScriptError("error", status);
        }else{
            
            //Message
            var json = {"buyerId": buyerId, "offerId" : offerId};
            var messageOfBuyed = Spark.message("soldOffer");
            messageOfBuyed.setExpireAfterHours(3);
            messageOfBuyed.setSendAsPush(false);
            messageOfBuyed.setPlayerIds([sellerId]);
            messageOfBuyed.setMessageData(json);
            messageOfBuyed.send();
            
            Spark.setScriptData("result",2);
            Spark.getRedis().incr ("Sold Offer");
        }

    }else{
         Spark.setScriptData("result",1);
    }
}

Spark.unlockKey(offerId);
