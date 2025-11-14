import { View, Text } from 'react-native'
import React from 'react'
import { useGetUserData } from '@/hooks/useGetUserData'
import HomeScreen from '@/screens/home/home.screen'

export default function index() {

  return (
    <HomeScreen />
  )
}