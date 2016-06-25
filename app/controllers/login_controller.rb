class LoginController < ApplicationController
  def index
    @redirect_to_host = ENV["app_url"] || "http://localhost:3000"
  end
end
