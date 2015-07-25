enable :sessions
require 'digest/sha1'

before do
  gon.pusher_key = ENV["PUSHER_KEY"]
  gon.channel_name = ENV["PUSHER_CHANNEL_NAME"]
  if session[:user] != nil
    gon.username = session[:user]["username"]
  else
    gon.username = "guest"
  end
end

get "/jack" do
  @page_title = "Jack's Testing"
  puts "Jack's testing"
	p @s3_direct_post = S3_BUCKET.presigned_post(key: "uploads/#{SecureRandom.uuid}/${filename}", success_action_status: 201, acl: :public_read)
	puts "Testing dotENV:"
	p ENV['AWS_SECRET_ACCESS_KEY']
	puts "Test bucket:"
	p AWS::S3.new.buckets[ENV['S3_BUCKET_NAME']]
end

get "/" do
	if session[:user]
    p @s3_direct_post = S3_BUCKET.presigned_post(key: "uploads/#{SecureRandom.uuid}/${filename}", success_action_status: 201, acl: :public_read)
    s3_hash = Hash.new
    s3_hash['url'] = @s3_direct_post.url
    s3_hash['urlstring'] = @s3_direct_post.url.to_s
    s3_hash['fields'] = @s3_direct_post.fields
    p gon.s3_hash = s3_hash
    @page_title = "FuzzFinders"
    @user_id = session[:user]["id"]
    # p @wags = session[:user]["wags"]
		erb :index
	else
		redirect "/sign_in"
	end
end

put "/sign_in" do
  p @s3_direct_post = S3_BUCKET.presigned_post(key: "uploads/#{SecureRandom.uuid}/${filename}", success_action_status: 201, acl: :public_read)
  s3_hash = Hash.new
  s3_hash['url'] = @s3_direct_post.url
  s3_hash['urlstring'] = @s3_direct_post.url.to_s
  s3_hash['fields'] = @s3_direct_post.fields
  gon.s3_hash = s3_hash
  options = params
  response = HTTParty.put("http://localhost:3000/api/v1/log_in?email=#{params[:email]}&password_hash=#{Digest::SHA1.hexdigest(params[:password_hash])}")
  unless response.body.empty?
    @user = JSON.parse(response.body)
    session[:user] = @user
    redirect "/"
  else
    erb :sign_in
  end
end

get "/sign_in" do
	erb :sign_in
end


post "/sign_up" do
  response = HTTParty.post("http://localhost:3000/api/v1/users?user[username]=#{params[:username]}&user[email]=#{params[:email]}&user[password_hash]=#{Digest::SHA1.hexdigest(params[:password_hash])}&user[zipcode]=#{params[:zip]}")
  if response.body
    @user=JSON.parse(response.body)
    session[:user] = @user
    redirect "/"
  else
    erb :sign_in
  end
end


get '/sign_out' do
	HTTParty.put("http://localhost:3000/api/v1/log_out?email=#{session[:user]["email"]}&password_hash=#{session[:user]["password_hash"]}")
  session.clear
  redirect "/"
end
