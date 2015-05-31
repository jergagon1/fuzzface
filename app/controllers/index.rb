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