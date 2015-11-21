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

post '/update_profile' do
  if session[:user]
    r = User.update_user_data(
      session[:user]['id'],
      session[:user]['email'],
      session[:user]['authentication_token'],
      params[:user]
    )

    content_type :json

    if r['status'] == 'Ok'
      session[:user] = r['user']
    end

    r.to_json
  end
end
