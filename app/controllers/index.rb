enable :sessions

get "/" do
	if session[:user]
		erb :index
	else
		redirect "/sign_in"
	end
end

put "/sign_in" do

	options = params
	p params
	#@response = HTTParty.put('http://localhost:3000/api/v1/log_in', options)
	response = HTTParty.put("http://localhost:3000/api/v1/log_in?email=#{params[:email]}&password_hash=#{params[:password_hash]}")

	if response.body
		@user = JSON.parse(response.body)
		session[:user] = @user
		p session[:user]
		redirect "/"
	else
		erb :sign_in
	end
end

get "/sign_in" do
	erb :sign_in
end


post "/sign_up" do
	response = HTTParty.post("http://localhost:3000/api/v1/users?user[username]=#{params[:username]}&user[email]=#{params[:email]}&user[password_hash]=#{params[:password_hash]}&user[zipcode]=#{params[:zip]}")
	if response.body
		@user=JSON.parse(response.body)
		session[:user] = @user
		redirect "/"
	else
		erb :sign_in
	end
end


# get '/sign_out' do
# 	HTTParty.put("http://localhost:3000/api/v1/log_out?email=#{params[:email]}&password_hash=#{params[:password_hash]}")
#   session.clear!
# end
