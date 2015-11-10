# JustVisual Demo Webapp

Justvisual API demo Web Application

## Requirements
1. [NodeJS](https://nodejs.org/en/)
2. Node Package Manager (Installed with NodeJS) 
3. [Grunt](http://gruntjs.com/) command line tool

## Install Dependencies

1. Download and install [NodeJS](https://nodejs.org/en/)
2. Install [Grunt](http://gruntjs.com/) Command line with npm:
	- Run: "npm install -g grunt-cli"
3. Go to root directory and run: "npm install"

## Configuration

1. Open config.json file and set your application parameters:
	- AppTitle: Application title
	- AppDescription: Your app description
	- AppVersion: Your app version
	- APISubDomain: Search API subdomain. [API Documentation](http://justvisual.com/api-docs/)
	- APIIndex: Search API index. [API Documentation](http://justvisual.com/api-docs/)
	- APIKey: Your api key. [API Documentation](http://justvisual.com/api-docs/)
	- H1Color, H1Color, H2Color, H3Color, BtnColor, BtnColorHover: Setup your app colors. 

## Installation

1. Go to root directory and run: "grunt install" (Run "grunt install-min" to create minified files)
2. 'Build' folder will be created with your web application static files
3. Deploy the build folder to your web server

JustVisual Dev Team.