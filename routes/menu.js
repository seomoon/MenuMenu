var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var path = require('path');
var connection = mysql.createConnection({   //mysql 연결 rds 주소
 
});
     
/*
 * Method       : GET
 * Path         : http://:3000/menu/:{name}
 * Description  : 메뉴를 출력합니다.  
 */

router.get('/:name', function(req,res){
     connection.query('select * from menu where rname=?;',  
                      [req.params.name],  
                      function(error, cursor){
      if(!error){
          if(cursor.length>0){ //제대로 들어왔고 DB에 식당이 있을 때
          res.status(200).json(cursor);
          }
          else{ //제대로 들어왔는데 DB에 식당이 없을 때
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
 * Method       : POST
 * Path         : http://:3000/menu/point
 * Description  : 포인트를 추가합니다.
 */
// 포인트 클릭 -> user의 point 증가, menu의 point 증가
router.post('/point', function(req, res, next) { //post(보안)는 보내기 get은 요청 둘 다 정보는 보냄
    //console.log("들어옴");     
    var email= req.body.email;
    var mnum= req.body.mnum;
    //var num=req.body.num;
    
       
    connection.query('select * from menupoint where email=? and mnum=? ;', // 목록에 이미 있는지 확인  
                     [email,mnum],
                    function(error, cursor){
          
            if(!error){ 
                if(cursor[0]){ // 목록에 있을 때 
                    //debug
                    //console.log('목록에 있습니다. ');   
                         res.status(204).json([{"result" : "DBerror"}]);
                    }else{ //목록에 없을 때
                    
                 connection.query('insert into menupoint ( mnum, email ) values (?,?);',  // 중복이 있는지 확인
                     [mnum,email],
                     function(error, cursor){
                      if(cursor[0]){ 
                          res.status(502); // 등록 실패
                        }else{
                            //debug
                            //console.log("등록 성공");  
                            //res.status(200).json([{"result" : "success"}]);
                            
                           
                           connection.query('UPDATE menu SET point = point+1 where num=?;',  
                                [mnum],
                                function(error, cursor){
                                    if(cursor[0]){ 
                                        res.status(502); // 등록 실패
                                    }else{
                                        //debug
                                        //console.log("등록 성공");  
                                        //res.status(200).json([{"result" : "success"}]);
                                         connection.query('UPDATE user SET point = point+1 where email=?;',  
                                            [email],
                                            function(error, cursor){
                                                if(cursor[0]){ 
                                                    res.status(502); // 등록 실패
                                                    }else{
                                                    //debug
                                                    //console.log("등록 성공");  
                                                        res.status(200).json([{"result" : "success"}]);}
                                      });
                                    }
                           });
                        }
                 });
                    }
            }else{
                //debug
                //console.log('db에러');
            }
    });
});


     
/*
 * Method       : GET
 * Path         : http://:3000/menu/smartmenu/:{name}/:{email}
 * Description  : point 순으로 메뉴를 나열합니다.+ 즐겨찾기 조회
 */

router.get('/smartmenu/:rname/:email', function(req,res){
    var email= req.params.email;
    connection.query('select * from menu where rname=? order by point desc;',
         [req.params.rname],
         function(error, cursor){
        if(!error){
            if(cursor.length>0){ // 내용이 있으면 
                //res.status(200).json(cursor);
                if(email=="null"){
                    //debug(로그인을 안했을 때)
                    //console.log("null 성공");
                     res.status(200).json(cursor);
                    
                }else{
                connection.query('select * from foodlike where email=?;',
                                [email],
                                function(error, cursor2){
              if(!error){
                  if(cursor2.length==0){//좋아요 누른 메뉴가 없을경우
                      res.status(200).json(cursor);                      
                  } else{
                     for(var i = 0; i<cursor.length; i++){
                         for(var j = 0; j<cursor2.length; j++)
                            {
                                if(cursor[i].num==cursor2[j].mnum)
                                    {   cursor[i].flike++; }
                            }
                     }
                    res.status(200).json(cursor);
                  }}
              /*  if(cursor2.length==0){// 즐겨찾기 등록하지 않은 레스토랑인 경우
                    res.status(200).json(cursor);
                    }else{// 즐겨찾기 등록한 레스토랑인 경우
                    res.status(202).json(cursor);
            }}*/
              else{
                  //debug
                  //console.log('db에러'+error);
                  res.status(501).json({result:false});
              }
                });
                    }
                }else{
                res.status(406).json({result:false, message:"일치하는 음식점이 없습니다."});
            }
        }else{
            //debug
            //console.log('db에러'+error);
            res.status(402).json({result:false});
        }
});
});

/*
 * Method       : GET
 * Path         : http://:3000/menu/photo/menu/:{photopath}
 * Description  :  사진의 경로를 검색해서 사진을 보내 줍니다. 
 */

router.get('/photo/menu/:photopath', function(req, res, next) {
    //debug   
    //console.log(__dirname);
    res.status(200).sendFile(path.join(__dirname, '..', 'photo','menu' ,  req.params.photopath+ '.png'));     
});

 


module.exports = router;