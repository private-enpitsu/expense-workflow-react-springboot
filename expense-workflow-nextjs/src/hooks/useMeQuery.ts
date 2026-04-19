import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../lib/apiClient";

export type MeResponse = {
  userId: number;
  username: string;
  email: string;
  role: "USER" | "APPLICANT" | "APPROVER" | "ADMIN";
};

export function useMeQuery() {
  const fetchMe = async () => {
    const res = await apiClient.get("/me");
    return res.data;
  };

  const { data, isLoading, error } = useQuery<MeResponse, AxiosError>({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const httpStatus = error?.response?.status ?? null;

  return { data, isLoading, error, httpStatus };
}
