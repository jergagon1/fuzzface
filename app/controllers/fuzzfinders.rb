enable :sessions

# gon gem gives access to variables from js
before do
  gon.pusher_key = ENV['PUSHER_KEY']
  gon.channel_name = ENV['PUSHER_CHANNEL_NAME']

  gon.api_server = ENV['SERVER_URL'] || 'http://localhost:3000'

  if session[:user].is_a? Hash
    u = session[:user]
    gon.username = u['username']
    gon.email = u['email']
    gon.auth_token = u['authentication_token']
    gon.latitude = u['latitude']
    gon.longitude = u['longitude']
    gon.user_id = u['id']
  else
    gon.username = 'guest'
  end
end

# method to retrieve user wags
def retrieve_wags
  if session[:user]
    @wags = User.wags(session[:user]['email'], session[:user]['authentication_token'])
  end
  # wags_data = HTTParty.get(ENV['SERVER_URL'] + "/api/v1/wags?email=#{session[:user]["email"]}&password_hash=#{session[:user]["password_hash"]}")
  # @wags = JSON.parse(wags_data.body)['wags']
end

# TODO: spec me
def handle_auth_response response_data
  response_data = JSON.parse response_data.body

  if response_data.present? && !response_data['error'] && !response_data['errors']
    session[:user] = response_data
  end

  if request.xhr?
    content_type :json

    response_data.to_json
  else
    if session[:user]
      redirect '/'
    else
      redirect '/sign_in'
    end
  end
end

post '/update_coodinates' do
  if session[:user]
    response_data = User.update_coordinates(params[:latitude], params[:longitude], params[:user_email], params[:user_token])

    if response_data.present?
      obj = JSON.parse(response_data.body)

      if obj['error'].nil?
        user = session[:user]
        user['latitude'] = params[:latitude]
        user['longitude'] = params[:longitude]

        gon.latitude = params[:latitude]
        gon.longitude = params[:longitude]

        session[:user] = user
      end
    end
  end

  { status: 'ok' }.to_json
end

get '/' do
  if session[:user]
    @page_title = 'FuzzFinders'
    @user_id = session[:user]['id']

    retrieve_wags

    erb :fuzzfinders
  else
    redirect '/sign_in'
  end
end

get '/js/app.js' do
  coffee 'coffee/app'.to_sym
end

get '/js/utils.js' do
  coffee 'coffee/utils'.to_sym
end

post '/sign_in' do
  handle_auth_response User.sign_in(params[:email], params[:password])
end

post '/send_instuctions' do
  content_type :json

  User.send_restore_password_instructions(params[:email]).to_json
end

get '/restore' do
  erb :restore, layout: :public_layout
end

get '/api/v1/users/password/edit' do
  # link from email
  redirect "/restore?reset_password_token=#{params[:reset_password_token]}"
end

post '/restore' do
  r = User.change_password(params[:reset_password_token], params[:password], params[:password_confirmation])

  @obj = JSON.parse(r.body)

  if @obj['errors']
    error = (@obj['errors']['reset_password_token'] || @obj['errors']['password'])[0]
    # redirect "/restore?reset_password_token=#{params[:reset_password_token]}&error=#{error}"
    erb :restore, layout: :public_layout
  else
    redirect '/'
  end
end

post '/sign_up' do
  handle_auth_response User.sign_up(params)
end

# log in action
get '/sign_in' do
  erb :sign_in, :layout => :public_layout
end

# sign out action
get '/sign_out' do
  session.clear
  redirect '/sign_in'
end

# public info pages
get '/fuzzfacts' do
  erb :fuzzfacts, :layout => :public_layout
end

get '/fuzzfable' do
  erb :fuzzfable, :layout => :public_layout
end

get '/fuzzfind_us' do
  erb :fuzzfind_us, :layout => :public_layout
end
