#!/bin/bash
echo "Starting script..."

if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed."
fi

echo "Installing packages..."
cd app # eventually
npm i
if [ -d "build" ]
then
    echo "Updating existing build..."
else
    echo "Creating new build directory..."
    mkdir build
fi

echo "Bulding frontend..."
npm run build 
sudo rm -rf /var/www/vhosts/frontend/build
sudo mkdir -p /var/www/vhosts/frontend/build
sudo cp -Rp build/* /var/www/vhosts/frontend/build

echo "Setting up Nginx configuration"
cd /etc/nginx/sites-enabled
rm -rf /etc/nginx/sites-enabled/default # eventually
echo 'server {
    listen 80 default_server;
    server_name _;

    location / {
        autoindex on;
        root /var/www/vhosts/frontend/build;
        try_files $uri /index.html;
    }
}' | sudo tee /etc/nginx/sites-available/react >/dev/null
sudo ln -s /etc/nginx/sites-available/react /etc/nginx/sites-enabled/

# Add www-data to ubuntu group
sudo gpasswd -a www-data ubuntu

echo "install Nginx..."
sudo apt update
sudo apt install nginx

echo "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl status nginx

echo "Script execution completed!"

