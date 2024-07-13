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

cd app
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

echo "Copying build to /var/www/vhosts/frontend..."
sudo rm -rf /var/www/vhosts/frontend/build
sudo mkdir /var/www/vhosts/frontend/build
sudo cp -Rp build/* /var/www/vhosts/frontend/build


echo "Setting up Nginx configuration"
cd /etc/nginx/sites-enabled
# sudo nano /etc/nginx/sites-available/react
sudo ln -s /etc/nginx/sites-available/react /etc/nginx/sites-enabled/

# Add www-data to ubuntu group
sudo gpasswd -a www-data ubuntu


echo "Restarting Nginx"
sudo systemctl restart nginx
sudo systemctl status nginx
echo "Script execution completed."
