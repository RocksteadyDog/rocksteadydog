var api = Spark.getGameDataService();

var playerID = Spark.getPlayer().getPlayerId();
var playerLevel = Spark.getData().level;

var playerData = api.getItem("playerData", playerID);


var eqLevel = api.N("itemLevel").eq(playerLevel);
var ltLevel = api.N("itemLevel").lt(playerLevel).or(eqLevel);
var sellerGroup = api.S("sellerId").ne(playerID).and(ltLevel);
var sortOffers = api.sort("advertiseTime", true);

var query = api.queryItems("globalMarket", sellerGroup, sortOffers);

if(query.error()){
    Spark.getLog().error({msg : "Query Error", type : "trade"});
    Spark.setScriptError("error", query.error())
}else{
    //var globalOffers = {};
    var globalOffers = [];
    var maximumCount = 50;
    var countDocs = 0;

    while(query.cursor().hasNext()){
    
        entry = query.cursor().next();
        
        var offer = entry.getData();
        
        delete offer["buyerId"];
        delete offer["slotIndex"];
        delete offer["state"];
        delete offer["advertiseTime"];
        delete offer["createdAt"];
        delete offer["itemLevel"];  
    
       globalOffers.push(offer);
      // globalOffers[entry.getId()] = offer;
        
        countDocs++;
        
        if ( countDocs >= maximumCount)
                break;
    }
    
    if ( countDocs == 0)
        Spark.getRedis().incr ("Global Market is Empty");
    
    Spark.setScriptData("globalOffers", globalOffers);
}
