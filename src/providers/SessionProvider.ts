"use client";
import { tUserSession } from "@/@types/tUser";
import { authService } from "@/services/api/AuthService";
import { getUserData } from "@/usecases/authCases";
import React, { createContext, useContext, useEffect, useState } from "react";

export const SessionContext = createContext<tUserSession | null>(
  {} as tUserSession
);
