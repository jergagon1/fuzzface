get "/fuzzfeed" do
  if session[:user]
    @page_title = "FuzzFeed"
    @user_id = session[:user]["id"]
    # p session[:user]["email"]
    # p session[:user]["password_hash"]
    retrieve_wags
    erb :fuzzfeed
  else
    redirect "/sign_in"
  end
end