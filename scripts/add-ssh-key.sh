#!/bin/bash
# Adds AI SSH public key to authorized_keys for permanent access
mkdir -p /Users/ec2-user/.ssh
chmod 700 /Users/ec2-user/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGsoxsSGhwVAKy3aBQk/HmbsRel5GeS1cOOpSg8A0gl9 antigravity-ai" >> /Users/ec2-user/.ssh/authorized_keys
chmod 600 /Users/ec2-user/.ssh/authorized_keys
chown -R ec2-user:staff /Users/ec2-user/.ssh
echo "SSH key added successfully - AI now has permanent access"
