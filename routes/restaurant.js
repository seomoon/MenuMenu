var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var path = require('path');
var connection = mysql.createConnection({   //mysql 연결 rds 주소

});

/*
 * Method       : GET
 * Path         : http://:3000/restaurant/:{rname}/:{email}
 * Description  : 식당을 나열하고 즐겨찾기를 표시합니다. 
 */

router.get('/:rname/:email', function(req,res){
     connection.query('select * from restaurant where name=?;',
                      [req.params.rname],   // 식당 이름  찾기
                      function(error, cursor){
                        if(!error){
                            if(cursor.length>0){ //제대로 들어왔고 DB에 식당이 있을 때
                                var email = req.params.email;
                                var rname = req.params.rname;
                                
                                if(email == "null"){
                                    //debug
                                    //console.log("null 성공");
                                    res.status(200).json(cursor[0]);
                                }else{
                                
                                connection.query('select * from restaurantlike,restaurant where restaurantlike.email=? and restaurantlike.rname = ?;', // 이메일이 같은것 찾기
                                [email,rname],
                                function(error, cursor2){
                                   if(!error){
                                    if(cursor2.length==0){//좋아요 누른 메뉴가 없을경우
                                        res.status(200).json(cursor[0]);                      
                                        } else{
                                            for(var i = 0; i<cursor.length; i++){
                                                for(var j = 0; j<cursor2.length; j++){
                                                    if(cursor[i].num==cursor2[j].mnum)
                                                    {   cursor[i].rlike=1;
                                                    
                                                    }
                                                }
                                            }
                                            res.status(200).json(cursor[0]);
                                            }}else{
                                //debug
                                //console.log('db에러'+error);
                                  //      res.status(501).json({result:false});
                                        }
                                });
                            }
                            }else{ //제대로 들어왔는데 DB에 식당이 없을 때
                            res.status(406).json({ result:false, message: "등록되지않다" });
                        }
                    } else { //들어올 때 에러 있을 경우
        //debug
        //console.log(error);
        res.status(402).json({ result:false, massage : "요청 에러" });
                    }
            }
)});




/*
 * Method       : GET
 * Path         : http://:3000/restaurant/photo/logo/:{photopath}
 * Description  : 로고 사진의 경로를 검색해서 사진을 보내 줍니다. 
 */
router.get('/photo/logo/:photopath', function(req, res, next) {
    //debug    
    //console.log(__dirname);
    res.status(200).sendFile(path.join(__dirname, '..', 'photo','logo' ,  req.params.photopath+ '.png'));     
});


/*
 * Method       : GET
 * Path         : http://:3000/restaurant/photo/restaurantphoto/:{photopath}
 * Description  : 식당 사진의 경로를 검색해서 사진을 보내 줍니다. 
 */
router.get('/photo/restaurantphoto/:photopath', function(req, res, next) {
    //debug    
    //console.log(__dirname);
    res.status(200).sendFile(path.join(__dirname, '..', 'photo','restaurantphoto' ,  req.params.photopath+ '.png'));     
});



/*
 * Method       : GET
 * Path         : http://:3000/restaurant/rcategory/:{x}/:{y}/:{distance}/:{detail}
 * Description  : 카테고리 별로 식당을 나열한다. 
 */
router.get('/rcategory/:x/:y/:distance/:detail', 
             function(req,res){ 
    connection.query('select *,(6371 * acos( cos(radians(?) ) * cos(radians(mapx)) * cos(radians(mapy) - radians(?) ) +                     sin( radians(?) ) * sin( radians( mapx ) ) ) ) AS distance'+
                            ' from restaurant,restaurantcategory '+
                            ' where restaurant.name = restaurantcategory.rname and restaurantcategory.detailcategory =?'+
                            ' having distance <= ?'+
                            ' order by distance;',   
                            [req.params.x,req.params.y,req.params.x,req.params.detail,req.params.distance],
                            function(error, cursor){
         
                if(!error){
                    if(cursor.length>0){ 
                        //제대로 들어왔고 DB에 식당이 있을 때
                        res.status(200).json(cursor);
                    }else{ //제대로 들어왔는데 DB에 식당이 없을 때
                        console.log(cursor);
                        res.status(406).json({ result:false, message: "등록되지않다" });
                    }
                }else{ //들어올 때 에러 있을 경우
                        //debug
                        //console.log(error);
                        res.status(502).json({ result:false, massage : "요청 에러" });
                }
            });
});



module.exports = router;

