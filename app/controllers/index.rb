get "/jack" do
	puts "Jack's testing"
	p @s3_direct_post = S3_BUCKET.presigned_post(key: "uploads/#{SecureRandom.uuid}/${filename}", success_action_status: 201, acl: :public_read)
	puts "Testing dotENV:"
	p ENV['AWS_SECRET_ACCESS_KEY']
	puts "Test bucket:"
	p AWS::S3.new.buckets[ENV['S3_BUCKET']]
end

get "/" do
	erb :index
end

put "/sign_in" do
    p "users_controller line 18"
    p @s3_direct_post = S3_BUCKET.presigned_post(key: "uploads/#{SecureRandom.uuid}/${filename}", success_action_status: 201, acl: :public_read)
    s3_hash = Hash.new
    s3_hash['url'] = @s3_direct_post.url
    s3_hash['urlstring'] = @s3_direct_post.url.to_s
    #p s3_hash['hostlink'] = @s3_direct_post.url.host
    s3_hash['fields'] = @s3_direct_post.fields
    #gon.push(s3_hash)
    p "line 26"
    p gon.s3_hash = s3_hash
 p "line 28"


	options = params
	p params
	#@response = HTTParty.put('http://localhost:3000/api/v1/log_in', options)
	response = HTTParty.put("http://localhost:3000/api/v1/log_in?email=#{params[:email]}&password_hash=#{params[:password_hash]}")

	if response.body
		@user = JSON.parse(response.body)
		p @user
		erb :main
	else
		erb :index
	end
end