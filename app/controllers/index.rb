enable :sessions
require 'digest/sha1'

# gon gives access to variables from js
before do
  gon.pusher_key = ENV["PUSHER_KEY"]
  gon.channel_name = ENV["PUSHER_CHANNEL_NAME"]
  if session[:user] != nil
    gon.username = session[:user]["username"]
  else
    gon.username = "guest"
  end
end

# setup method for image file upload to Amazon S3 bucket
def setup_s3
  @s3_direct_post = S3_BUCKET.presigned_post(key: "uploads/#{SecureRandom.uuid}/${filename}", success_action_status: 201, acl: :public_read)
  @s3_hash = Hash.new
  @s3_hash['url'] = @s3_direct_post.url
  @s3_hash['urlstring'] = @s3_direct_post.url.to_s
  @s3_hash['fields'] = @s3_direct_post.fields
  gon.s3_hash = @s3_hash
end

# FuzzFinders page
get "/" do
	if session[:user]
    setup_s3
    @page_title = "FuzzFinders"
    @user_id = session[:user]["id"]
    # p session[:user]["email"]
    # p session[:user]["password_hash"]
    wags_data = HTTParty.get("http://localhost:3000/api/v1/wags?email=#{session[:user]["email"]}&password_hash=#{session[:user]["password_hash"]}")
    @wags = JSON.parse(wags_data.body)["wags"]
		erb :index
	else
		redirect "/sign_in"
	end
end

# log in
put "/sign_in" do
  setup_s3
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
