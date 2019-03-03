var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var connection = mysql.createConnection({   //mysql 연결 rds 주소
  
});

/*
 * Method       : get
 * Path         : http://:3000/map/:{x}/:{y}/:{distance}
 * Description  : 사용자의 현재위치에서 특정 반경의 식당을 출력합니다. 
 */

router.get('/:x/:y/:distance', function(req,res){ // 거리구하기 (100m = 0.1)
            connection.query('select *,(6371 * acos( cos( radians(?) ) * cos( radians( mapx ) ) * cos( radians( mapy ) - radians(?) ) +                     sin( radians(?) ) * sin( radians( mapx ) ) ) ) AS distance'+
                            ' from restaurant having distance <= ?'+ 
                            ' order by distance;',   
                            [req.params.x,req.params.y,req.params.x,req.params.distance],
                            function(error, cursor){
         
                if(!error){
                    if(cursor.length>0){ //제대로 들어왔고 DB에 식당이 있을 때
                        res.status(200).json(cursor);
                    }else{ //제대로 들어왔는데 DB에 식당이 없을 때
                        res.status(506).json({ result:false, message: "등록되지않다" });
                    }
                }else{ //들어올 때 에러 있을 경우
                        //debug
                        //console.log(error);
                        res.status(402).json({ result:false, massage : "요청 에러" });
                }
            });
});

module.exports = router;
