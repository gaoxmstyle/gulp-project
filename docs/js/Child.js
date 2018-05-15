class Child {
    constructor(){
        console.log('child 123'); 
        if(window.hzShare){
            hzShare({
                title:'默认分享标题',
                desc:'默认分享描述',
                link:window.location.href,
                imgUrl:''
            });
        }
    }
}   

export default Child