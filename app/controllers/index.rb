get "/" do
	erb :index
end

put "/sign_in" do

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


post "/sign_up" do
	response = HTTParty.post("http://localhost:3000/api/v1/users?user[username]=#{params[:username]}&user[email]=#{params[:email]}&user[password_hash]=#{params[:password_hash]}&user[zipcode]=#{params[:zip]}")
	if response.body
		@user=JSON.parse(response.body)
		erb :main
	else
		erb :index
	end
end


# get '/sign_out' do
# 	HTTParty.put("http://localhost:3000/api/v1/log_out")
# end
