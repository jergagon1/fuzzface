get "/fuzzfeed" do
  if session[:user]
    @page_title = "FuzzFeed"
    @user_id = session[:user]["id"]
    p session[:user]["email"]
    p session[:user]["password_hash"]
    wags_data = HTTParty.get("http://localhost:3000/api/v1/wags?email=#{session[:user]["email"]}&password_hash=#{session[:user]["password_hash"]}")
    @wags = JSON.parse(wags_data.body)["wags"]
    erb :fuzzfeed
  else
    redirect "/sign_in"
  end
end