#!/bin/bash

# Start the proxy in the background
kubectl proxy &

# Get the token
echo "Getting authentication token..."
TOKEN=$(kubectl -n kubernetes-dashboard create token admin-user)

echo "============================================"
echo "Kubernetes Dashboard is starting..."
echo "URL: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
echo "============================================"
echo "Authentication Token:"
echo $TOKEN
echo "============================================"
echo "Press Ctrl+C to stop the dashboard"

# Wait for Ctrl+C
wait 