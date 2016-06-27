class TokenController < ApplicationController

  attr_accessor :firstname

  def receive
    @errors=params["error"]

    if !params.has_key?("code") || params["code"].blank?
      raise("Authorization failed (#{@errors})")
    end

    code=params["code"]
    access_token,athlete_id = authenticate(code)
    strava_stats = get_strava_stats(access_token,athlete_id)
    @art = strava_stats["all_ride_totals"]
    @art["athlete_id"] = athlete_id

    respond_to do |format|
      format.html
      format.json { render json: @art }
    end
  end


  def humanize secs
    [[60, :seconds], [60, :minutes], [24, :hours], [1000, :days]].map{ |count, name|
      if secs > 0
        secs, n = secs.divmod(count)
        "#{n.to_i} #{name}"
      end
    }.compact.reverse.join(' ')
  end

  helper_method :humanize

  private

  def authenticate(code)
    require 'net/http'
    require 'uri'

    client_id = "12179"
    client_secret = ENV['STRAVA_API_SECRET']
    if client_secret.nil?
      raise("Strava API Secret is not set")
    end
    post_data = {"client_id"=>client_id, "client_secret"=>client_secret, "code"=>code}
    uri = URI.parse("https://www.strava.com/oauth/token")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    request = Net::HTTP::Post.new(uri.request_uri)
    request.set_form_data(post_data)
    response = http.request(request)

    if !response.code === 200
      raise("Error during OAuth. Code: #{response.code} - '#{response.body}'")
    end

    resObj = JSON.parse(response.body)
    access_token = resObj["access_token"]
    athlete_id = resObj["athlete"]["id"]
    @firstname = resObj["athlete"]["firstname"]

    return access_token,athlete_id
  end

  def get_strava_stats(access_token,athlete_id)
    require 'strava/api/v3'

    logger.debug("Authenticating with access token '#{access_token}' for athlete #{athlete_id}")
    client = Strava::Api::V3::Client.new(:access_token => access_token)
    return client.totals_and_stats(athlete_id)
  end
end
