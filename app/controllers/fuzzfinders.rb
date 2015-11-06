require 'digest/sha1'

enable :sessions

# we need store user's email and authentication token in session
# after users signin or signup

# gon gem gives access to variables from js
before do
  gon.pusher_key = ENV['PUSHER_KEY']
  gon.channel_name = ENV['PUSHER_CHANNEL_NAME']
  if session[:user].is_a? Hash
    u = session[:user]
    gon.username = u['username']
    gon.email = u['email']
    gon.auth_token = u['authentication_token']
    gon.latitude = u['latitude']
    gon.longitude = u['longitude']
  else
    gon.username = 'guest'
  end
end

# setup method for image file upload to Amazon S3 bucket
def setup_s3
  user_id = session[:user] ? session[:user]['id'].to_s + '-' : 'none-'
  @s3_direct_post = S3_BUCKET.presigned_post(key: "uploads/#{ user_id + SecureRandom.uuid}/${filename}", success_action_status: 201, acl: :public_read)
  @s3_hash = Hash.new
  @s3_hash['url'] = @s3_direct_post.url
  @s3_hash['urlstring'] = @s3_direct_post.url.to_s
  @s3_hash['fields'] = @s3_direct_post.fields
  gon.s3_hash = @s3_hash
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

    setup_s3
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
    setup_s3
    @page_title = 'FuzzFinders'
    @user_id = session[:user]['id']

    retrieve_wags

    erb :fuzzfinders
  else
    redirect '/sign_in'
  end
end

get '/app.js' do
  coffee :app
end

post '/sign_in' do
  handle_auth_response User.sign_in(params[:email], params[:password])
end

post '/sign_up' do
  handle_auth_response User.sign_up(params)
end

# log in action
get '/sign_in' do
  erb :sign_in
end

# sign out action
get '/sign_out' do
  session.clear
  redirect '/sign_in'
end
