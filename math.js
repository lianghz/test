exports.add=function(){
	var sum = 0,i=0,args=arguments,l=args.lenght;
	while(i<l){
		sum += args[i++];
	}
	return sum;
}