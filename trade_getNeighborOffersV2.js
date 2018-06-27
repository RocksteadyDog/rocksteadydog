
var api = Spark.getGameDataService();

var sellerId = Spark.getData().sellerId;
var playerLevel = Spark.getData().level;

var doc = api.getItem("playerTradeData", sellerId).document();

if (doc == null)
{
   Spark.getLog().error({msg : "Player Document is null!", type : "trade"});
   Spark.setScriptError("error","Player Document is null!");
   Spark.exit();
}

function GetOffers(sellerOffers){
    
    var offers = [];
    
    var currentCount = 0;
    var maximumCount = 32;
    
    for ( i = 0 ; i < sellerOffers.length; i++){
        
      var currentOffer = sellerOffers[i];
      
      if (currentOffer == null)
            continue;
            
      if (currentOffer.state != 2 && currentOffer.itemLevel <= playerLevel ){
          
          var pushOffer = {};
          pushOffer.offerId = currentOffer.offerId;
          pushOffer.itemId = currentOffer.itemId;
          pushOffer.price = currentOffer.price;
          pushOffer.quantity = currentOffer.quantity;
          pushOffer.sellerId = currentOffer.sellerId;
          
        //   delete currentOffer["advertiseTime"];
        //   delete currentOffer["createdAt"];
        //   delete currentOffer["buyerId"];
        //   delete currentOffer["city"];
        //   delete currentOffer["itemLevel"];
        //   delete currentOffer["state"];
        //   delete currentOffer["slotIndex"];

          offers.push(pushOffer);
          
          currentCount++;
          if (currentCount >= maximumCount)
                break;
      }
    }    
   return offers;
}

var playerData = doc.getData();
var offers = GetOffers(playerData.offers);

Spark.setScriptData("offers",offers);

