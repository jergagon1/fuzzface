get "/fuzzfile" do
  if session[:user]
    @page_title = "FuzzFile"
    @user_id = session[:user]["id"]
    # p session[:user]["email"]
    # p session[:user]["password_hash"]
    @user = session[:user]
    retrieve_wags
    erb :fuzzfile
  else
    redirect "/sign_in"
  end
end